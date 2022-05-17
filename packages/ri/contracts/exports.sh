#! usr/bin/bash
ABIS=(
  # Add greps to export here 
  *Component
  *Facet
  World
  Diamond
)

EXCLUDE=(
  # Add files not to export here 
  Component 
)

for file in ${ABIS[@]}; do
  cp out/$file.sol/*.json abi/;
done

for file in ${EXCLUDE[@]}; do
  rm abi/$file.json;
done
