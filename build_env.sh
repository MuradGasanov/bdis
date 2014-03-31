#!/bin/bash
echo $0: Creating virtual environment
virtualenv --prompt="<bdis_env>" ../bdis_env

mkdir ../bdis_logs
mkdir ../bdis_pids
mkdir ../bdis_static/static
mkdir ../bdis_static/media

echo $0: Installing dependencies
source ../bdis_env/bin/activate
export PIP_REQUIRE_VIRTUALENV=true
../bdis_env/bin/pip install --requirement=./requirements.conf --log=./bdis_logs/build_pip_packages.log

echo $0: Making virtual environment relocatable
virtualenv --relocatable ../bdis_env

echo $0: Creating virtual environment finished.