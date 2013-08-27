#!/usr/bin/env bash
set -o errexit
set -o nounset

#-------------------------------------------------------------------------------
# Determine the VPC for the provided region and VPC name.
#
# @param $1 - The region that the VPC is in
# @param $2 - The name of the VPC (dev, qa, prod)
# @return   - The ID of the VPC
#-------------------------------------------------------------------------------
function get_vpc_id() {
  local region="${1}"
  local name="${2}"

  ec2-describe-vpcs                     \
    --region "${region}"                \
    --filter "tag:bv:nexus:vpc=${name}" \
    --hide-tags                         |
  cut -f2
}

#-------------------------------------------------------------------------------
# Determine the subnets for the provided VPC organized by AZ.
#
# @param $1 - The region that the VPC (and its subnets) is in
# @param $2 - The ID of the VPC
# @return   - The availability zone followed by the private subnet then the
#             public subnet, one triple per line
#-------------------------------------------------------------------------------
function get_subnets() {
  local region="${1}"
  local vpc="${2}"

  join -j2                                          \
    <(ec2-describe-subnets                          \
        --region "${region}"                        \
        --filter "vpc-id=${vpc}"                    \
        --filter "tag:bv:nexus:role=PrivateSubnet*" \
        --hide-tags                                 |
        cut -f2,7                                   |
        sort -k2)                                   \
    <(ec2-describe-subnets                          \
        --region "${region}"                        \
        --filter "vpc-id=${vpc}"                    \
        --filter "tag:bv:nexus:role=PublicSubnet*"  \
        --hide-tags                                 |
        cut -f2,7                                   |
        sort -k2)
}

#-------------------------------------------------------------------------------
# Create (or update) the desired stack in AWS.
#
# This function will use the EC2 APIs to determine the IDs of all of the VPC 
# resources that need to be provided to the CloudFormation script.  Once it has
# figured them out, it will invoke CloudFormation to create a new stack.
#
# @param $1 - The operation to perform on the stack (create or update)
# @param $2 - The CloudFormation template to perform the operation with
# @param $3 - The region to create the stack in (us-east-1, eu-west-1, etc.)
# @param $4 - The environment to create the stack in (dev, qa, prod)
# @param $5 - The version the software to install (optional)
# @param $6 - The type of instances to create (optional)
# @param $7 - A suffix to append to the name of stack resources (optional)
#-------------------------------------------------------------------------------
function create_or_update_stack() {
  local op="${1}"
  local template="${2}"
  local region="${3}"
  local environment="${4}"
  local version="${5}"
  local instance_type="${6:-}"
  local suffix="${7:-}"

  # The name of the stack to create
  local stack="$(basename "${template}" .json)"

  # Determine the VPC id as well as the ids of all of the subnets
  local vpc="$(get_vpc_id "${region}" "${environment}")"
  local subnet_azs=()
  local private_subnets=()
  local public_subnets=()
  while read i az private public; do
    subnet_azs[$i]=${az}
  	private_subnets[$i]=${private}
  	public_subnets[$i]=${public}
  done < <(get_subnets "${region}" "${vpc}" | nl)

  # Make the assumption that the following parameters are always required
  local params=("VpcId=${vpc}" "Environment=${environment}")

  # The set of parameters that could be optionally provided
  if [[ -n "${instance_type}" ]]; then
    params+=("InstanceType=${instance_type}")
  fi

  if [[ -n "${version}" ]]; then
    params+=("Version=${version}")
  fi

  if [[ -n "${instance_type}" ]]; then
    params+=("InstanceType=${instance_type}")
  fi

  if [[ -n "${suffix}" ]]; then
    params+=("Suffix=-${suffix}")
  fi

  # See what additional parameters the template needs that can be inferred from
  # the VPC.  These are things like subnet ids, etc.
  while IFS="|" read type name _; do
    if [[ "${type}" == "PARAMETERS" ]]; then
      case "${name}" in
        "PrivateSubnetId")  params+=("PrivateSubnetId=${private_subnets[1]}");;
        "PrivateSubnet1Id") params+=("PrivateSubnet1Id=${private_subnets[1]}");;
        "PrivateSubnet2Id") params+=("PrivateSubnet2Id=${private_subnets[2]}");;
        "PrivateSubnet3Id") params+=("PrivateSubnet3Id=${private_subnets[3]}");;
        "PrivateSubnetAZ")  params+=("PrivateSubnetAZ=${subnet_azs[1]}");;
        "PrivateSubnet1AZ") params+=("PrivateSubnet1AZ=${subnet_azs[1]}");;
        "PrivateSubnet2AZ") params+=("PrivateSubnet2AZ=${subnet_azs[2]}");;
        "PrivateSubnet3AZ") params+=("PrivateSubnet3AZ=${subnet_azs[3]}");;

        "PublicSubnetId")  params+=("PublicSubnetId=${public_subnets[1]}");;
        "PublicSubnet1Id") params+=("PublicSubnet1Id=${public_subnets[1]}");;
        "PublicSubnet2Id") params+=("PublicSubnet2Id=${public_subnets[2]}");;
        "PublicSubnet3Id") params+=("PublicSubnet3Id=${public_subnets[3]}");;
        "PublicSubnetAZ")  params+=("PublicSubnetAZ=${subnet_azs[1]}");;
        "PublicSubnet1AZ") params+=("PublicSubnet1AZ=${subnet_azs[1]}");;
        "PublicSubnet2AZ") params+=("PublicSubnet2AZ=${subnet_azs[2]}");;
        "PublicSubnet3AZ") params+=("PublicSubnet3AZ=${subnet_azs[3]}");;
      esac
    fi
  done < <(cfn-validate-template --template-file "${template}" --show-empty-fields --show-long --delimiter "|")

  local parameters=$(IFS=";"; echo "${params[*]}")
  cfn-${op}-stack                                   \
    "${environment}-${stack}${suffix:+-${suffix}}"  \
    --region "${region}"                            \
    --template-file="${template}"                   \
    --parameters "${parameters}"
}

#-------------------------------------------------------------------------------
# Emit an error message and then usage information and then exit the program.
#-------------------------------------------------------------------------------
function error() {
  echo 1>&2 "ERROR: $@"
  echo 1>&2
  usage
  exit 1
}

#-------------------------------------------------------------------------------
# Emit the program's usage to the console.
#-------------------------------------------------------------------------------
function usage() {
    cat <<EOF
Usage: ${0#./} [OPTION]...

Options:
  --template <filename>
      The CloudFormation template to create a stack for.

  --region <region>
      The AWS region to create the stack in.

  --environment <name>
      Which environment (dev, qa, prod) to create the stack in.

  --version <version>
      The version of the software to install.  This should be a verison number
      that corresponds to an RPM in the Yum repo.

  --instance-type <type>
      What sized instances to start.  Can be any of the instance types supported
      for creation within a VPC.

  --suffix <name>
      A name for this stack (typically used for developer deployments).

  -h/--help
      Display this help message.
EOF
}

#-------------------------------------------------------------------------------
# Main program.
#-------------------------------------------------------------------------------
function main() {
  local template=""
  local region=""
  local environment=""
  local instance_type=""
  local version=""
  local suffix=""

  local op=""
  if [[ $0 =~ "create" ]]; then
    op="create"
  elif [[ $0 =~ "update" ]]; then
    op="update"
  else
    error "Unable to determine operation from binary name: $0"
  fi

  # Parse the arguments from the commandline.
  while [[ ${#} -gt 0 ]]; do
    case "${1}" in
      --template)      template="${2}"; shift;;
      --region)        region="${2}"; shift;;
      --environment)   environment="${2}"; shift;;
      --instance-type) instance_type="${2}"; shift;;
      --version)       version="${2}"; shift;;
      --suffix)        suffix="${2}"; shift;;
      -h|--help)       usage; exit 0;;
      --)              break;;
      -*)              error "Unrecognized option ${1}";;
    esac

    shift
  done

  if [[ -z "${template}" ]]; then
    error "The CloudFormation template must be specified."
  fi

  if [[ -z "${region}" ]]; then
    error "The region to install in must be specified."
  fi

  if [[ -z "${environment}" ]]; then
    error "The environment to install in must be specified."
  fi

  if [[ -z "${version}" ]]; then
    error "The version to install must be specified."
  fi

  if [[ "${suffix:0:1}" == "-" ]]; then
    suffix="${suffix:1}"
  fi

  create_or_update_stack \
    "${op}"              \
    "${template}"        \
    "${region}"          \
    "${environment}"     \
    "${version}"         \
    "${instance_type}"   \
    "${suffix}"
}

main "${@:-}"
