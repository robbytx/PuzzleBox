#!/usr/bin/env bash
set -o errexit
set -o nounset

#-------------------------------------------------------------------------------
# Install script for PuzzleBox.
#
# This script does the following to the host that it is run on:
#
# 1) Installs and configures the PuzzleBox RPM.
#
# 2) Installs the Caber Toss rsyslog transmitter so system logs show up in
#    Sumologic.
#
# 3) Installs the DataDog agent for system metrics collection.
#-------------------------------------------------------------------------------

#-------------------------------------------------------------------------------
# Log a message.
#-------------------------------------------------------------------------------
function log() {
  echo 1>&2 "$@"
}

#-------------------------------------------------------------------------------
# Display an error message to standard error and then exit the script with a
# non-zero exit code.
#-------------------------------------------------------------------------------
function error() {
  echo 1>&2 "ERROR: $@"
  echo 1>&2
  usage
  exit 1
}

#-------------------------------------------------------------------------------
# Determine the ID of the currently running EC2 instance.
#-------------------------------------------------------------------------------
function get_ec2_instance_id() {
  /opt/aws/bin/ec2-metadata --instance-id |
  cut -d" " -f2
}

#-------------------------------------------------------------------------------
# Determine which region the currently running instance is in.
#-------------------------------------------------------------------------------
function get_ec2_instance_region() {
  /opt/aws/bin/ec2-metadata --availability-zone |
  cut -d" " -f2 |
  sed "s/.$//g"
}

#-------------------------------------------------------------------------------
# Determine the value of a tag on this instance.
#
# This is determined from the EC2 tags on the current instance.
#-------------------------------------------------------------------------------
function get_ec2_instance_tag() {
  local tag="${1}"
  local region="$(get_ec2_instance_region)"
  local instance_id=$(get_ec2_instance_id)

  while [[ true ]]; do
    local value=$(/opt/aws/bin/ec2-describe-tags          \
                    --region "${region}"                  \
                    --filter resource-id="${instance_id}" \
                    --filter key="${tag}"                 |
                  cut -f5)
    if [[ -n "${value}" ]]; then
      break
    fi
    sleep 5
  done

  echo "${value}"
}

#-------------------------------------------------------------------------------
# Determine the environment that this server is running in.
#
# This is determined from the EC2 tags on the current instance.
#-------------------------------------------------------------------------------
function get_environment() {
  get_ec2_instance_tag "bv:nexus:vpc"
}

#-------------------------------------------------------------------------------
# Install a package, retrying if it fails.
#-------------------------------------------------------------------------------
function yum_install() {
  local package="${1}"

  while ! yum install -y "${package}"; do
    log "Failed to install ${package}"
    sleep 15
    log "Trying again."
  done
}

#-------------------------------------------------------------------------------
# Set hostname and perform any necessary related tasks.
#
# @param $1 - The desired hostname of the server.
#-------------------------------------------------------------------------------
function set_hostname() {
  local hostname="${1}"
  hostname "${hostname}"

  local expr="s/^([[:space:]]*HOSTNAME=)[^[:space:]]*/\1${hostname}/"
  sed -ri "${expr}" /etc/sysconfig/network
}

#-------------------------------------------------------------------------------
# Registers a DNS entry for this server.
#
# NOTE: This method relies on the hostname having been set prior to calling.
#-------------------------------------------------------------------------------
function create_dns_entry() {
  local name="$(hostname)"
  local url="http://$(get_environment)-nexus-dns1:8080/registration"

  log "Creating DNS entry (${name})..."
  curl -s -X POST -d "name=${name}" "${url}"
  log "Done."
}

#-------------------------------------------------------------------------------
# Setup the yum so that we can install packages from our S3 repos.
#-------------------------------------------------------------------------------
function setup_yum() {
  local public_repo="https://nexus-public-artifacts.s3.amazonaws.com/yum-repo"

  log "Installing the yum plugin for S3 based yum repos..."
  yum_install "${public_repo}/yum-plugin-s3-0.2.1-bv1.noarch.rpm"
  log "Done."

  log "Installing the nexus-public-artifacts repo..."
  yum_install "${public_repo}/bv-nexus-public-artifacts-0.1.noarch.rpm"
  log "Done."

  log "Enable the EPEL repo..."
  yum-config-manager --enable epel
  log "Done."

  # Install the version lock plugin so we can pin our RPMs to specific versions
  # and prevent them from being upgraded without explicit user action
  log "Installing the yum versionlock plugin..."
  yum_install "yum-plugin-versionlock"
  log "Done."
}

#-------------------------------------------------------------------------------
# Install and configure caber toss on the current instance.
#-------------------------------------------------------------------------------
function install_cabertoss() {
  local cabertoss_repo="https://s3.amazonaws.com/cabertoss/cabertoss/RPMS"

  log "Installing the caber toss repo..."
  yum_install "${cabertoss_repo}/cabertoss-repo-1.0.1-bv1.noarch.rpm"
  log "Done."

  log "Installing the caber toss transmitter..."
  yum_install cabertoss-transmitter
  log "Done."
}

function setup_mongo() {
  log "Starting the mongo service"
  service mongod start
  log "Done."
}

#-------------------------------------------------------------------------------
# Install and configure PuzzleBox on the current instance.
#
# @param $1 - The version of the puzzlebox RPM to install.
# @param $2 - The id of the volume to store data on.
# @param $3 - The (optional) suffix for this installation, added to the hostname.
# @param $4 - The (optional) DataDog API key
#-------------------------------------------------------------------------------
function install_puzzlebox() {
  local version="${1}"
  local volume_id="${2}"
  local suffix="${3}"
  local datadog_key="${4:-}"

  log "Installing the puzzlebox repo..."
  yum_install "puzzlebox-artifacts"
  log "Done."

  log "Installing puzzlebox..."
  yum_install "puzzlebox-${version}"
  yum versionlock "puzzlebox"
  log "Done."

  log "Attaching the EBS volume..."
  while ! /opt/aws/bin/ec2-attach-volume          \
            --region "$(get_ec2_instance_region)" \
            "${volume_id}"                        \
            -i "$(get_ec2_instance_id)"           \
            -d "/dev/sdh"; do
    log "Couldn't attach the EBS volume ${volume_id} as /dev/sdh. Looping..."
    sleep 10
  done

  while [[ ! -b "/dev/sdh" ]]; do
    log "Waiting for AWS to finish attaching the EBS volume. Looping..."
    sleep 10
  done
  log "Done."

  # Only create a filesystem if one doesn't exist on the EBS volume (first time
  # we're bring up a server with this EBS volume).
  if [[ $(blkid -o list /dev/sdh | grep -c ext4) != '1' ]]; then
    log "Creating an ext4 filesystem on EBS volume..."
    mkfs.ext4 "/dev/sdh"
    log "Done"
  fi

  log "Configuring EBS volume to mount on reboot..."
  cat - >>/etc/fstab <<EOF

# device   mount point              type   options    dump  pass
/dev/sdh   /var/lib/puzzlebox   ext4   defaults   0     0

EOF
  log "Done."

  log "Mounting EBS volume at /var/lib/puzzlebox..."
  mkdir -p "/var/lib/puzzlebox"
  mount "/var/lib/puzzlebox"
  mkdir -p "/var/lib/puzzlebox/data"
  chown -R puzzlebox:puzzlebox "/var/lib/puzzlebox/data"
  log "Done."

  log "Starting puzzlebox..."
  service puzzlebox start
  log "Done."
}

#-------------------------------------------------------------------------------
# Install and configure the DataDog agent on the current instance.
#-------------------------------------------------------------------------------
function install_datadog_agent() {
  local api_key="${1}"
  local suffix="${2}"

  log "Installing the DataDog repo..."
  yum_install "datadog-repo"
  log "Done."

  log "Installing the DataDog agent..."
  yum_install datadog-agent
  log "Done."

  log "Writing DataDog agent configuration..."
  local tags=""
  tags="${tags:+$tags, }puzzlebox${suffix}"
  tags="${tags:+$tags, }region:$(get_ec2_instance_region)"
  tags="${tags:+$tags, }env:$(get_ec2_instance_tag "bv:nexus:vpc")"
  tags="${tags:+$tags, }environment:$(get_ec2_instance_tag "bv:nexus:vpc")"

  cat /etc/dd-agent/datadog.conf.example       |
  sed -r "s/^api_key:.*/api_key: ${api_key}/"  |
  sed -r "s/.?tags:.*/tags: ${tags}/" > /etc/dd-agent/datadog.conf
  log "Done."

  log "Starting the DataDog agent..."
  service datadog-agent start
  log "Done."
}

#-------------------------------------------------------------------------------
# Display the usage message for how this script should be invoked.
#-------------------------------------------------------------------------------
function usage() {
  cat <<EOF
Usage: ${0#./} [OPTION]...

Options:
  --version <version>
      The version of the PuzzleBox RPM to install.  This should be a
      version number that corresponds to a version that is present in the Yum
      repo.

  --volume-id <id>
      The id of the EBS volume that contains all PuzzleBox data.

  --datadog-key <key>
      An API key for the DataDog agent to use to publish metrics to DataDog.
      If present then the DataDog agent will be installed and started on boot.
      (optional)

  --suffix <name>
      This suffix will to be appended to all DNS entries, badger registrations,
      etc. (optional)

  -h/--help
      Display this help message.
EOF
}

#-------------------------------------------------------------------------------
# Main entry point.
#-------------------------------------------------------------------------------
function main() {
  local version=""
  local volume=""
  local datadog_key=""
  local suffix=""

  while [[ ${#} -gt 0 ]]; do
    case "${1}" in
      --version)        version="${2}"; shift;;
      --volume-id)      volume="${2}"; shift;;
      --datadog-key)    datadog_key="${2}"; shift;;
      --suffix)         suffix="${2}"; shift;;
      -h|--help)        usage; exit 0;;
      --)               break;;
      -*)               error "Unrecognized option ${1}";;
    esac

    shift
  done

  if [[ -z "${version}" ]]; then
    error "The version to install must be specified."
  fi

  if [[ -z "${volume}" ]]; then
    error "The EBS volume to store data on must be specified."
  fi

  log "Parameters:"
  log "  version:     ${version}"
  log "  volume:      ${volume}"
  log "  datadog-key: ${datadog_key}"
  log "  suffix:      ${suffix}"
  log

  # Set the hostname and create the DNS entry first so that we can easily SSH
  # in and debug if something goes wrong.
  set_hostname "puzzlebox${suffix}"
  create_dns_entry

  setup_yum
  setup_mongo
  install_cabertoss

  install_puzzlebox  \
    "${version}"     \
    "${volume}"      \
    "${suffix}"      \
    "${datadog_key}"

  # Install the DataDog agent if we have an API key for it.
  if [[ -n "${datadog_key}" ]]; then
    install_datadog_agent \
      "${datadog_key}"    \
      "${suffix}"
  fi
}

main "$@"