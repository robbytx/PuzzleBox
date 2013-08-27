# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|
  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "centos-6.4-64bit"

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "http://developer.nrel.gov/downloads/vagrant-boxes/CentOS-6.4-x86_64-v20130309.box"

  config.vm.forward_port 5000, 5000   # This is the port that the node app listens on

  config.vm.provision :shell do |shell|
    shell.inline = <<-eos
      #!/bin/bash

      # Make the firewall wide open
      /sbin/chkconfig --level 2345 iptables off >/dev/null
      /sbin/chkconfig --level 2345 ip6tables off >/dev/null
      service iptables stop >/dev/null
      service ip6tables stop >/dev/null

      # Install man pages.  Someone thought it was a good idea to create an image without man.
      yum install -y man

      # Install the EPEL package repository.  It has all of the node/mongo/redis pacakges.
      yum install -y http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm

      # Install packages...
      yum install --enablerepo epel -y nodejs npm mongodb-server
      npm config set color false

      # Start data stores...
      service mongod start

      # Setup the PuzzleBox directory...
      [[ ! -e "PuzzleBox" ]] && ln -s /vagrant PuzzleBox

      # Install nodemon
      npm -g install nodemon >/dev/null
    eos
  end
end
