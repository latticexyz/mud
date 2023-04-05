module.exports = {
  hooks: {
    readPackage,
  },
};

const desiredPackageVersions = {
  "@ethersproject/abi": "^5.7.0",
  "@ethersproject/providers": "^5.7.2",
  ethers: "^5.7.2",
};

function readPackage(pkg) {
  // I was seeing the following TS error in `network` and other packages:
  //
  //   The inferred type of 'createNetwork' cannot be named without a reference to '.pnpm/@ethersproject+providers@5.7.2/node_modules/@ethersproject/providers'. This is likely not portable. A type annotation is necessary.
  //
  // This seems to come from some combination of using/exporting ethers internals and also typechain-generated files. This is made worse by the fact that typechain uses older versions of ethers, which makes it harder for us and TS to resolve the proper types. So we'll normalize the version numbers here.
  if (pkg.name === "@typechain/ethers-v5") {
    Object.entries(desiredPackageVersions).forEach(([packageName, desiredVersion]) => {
      if (pkg.devDependencies[packageName]) {
        pkg.devDependencies[packageName] = desiredVersion;
      }
      if (pkg.peerDependencies[packageName]) {
        pkg.peerDependencies[packageName] = desiredVersion;
      }
    });
  }
  return pkg;
}
