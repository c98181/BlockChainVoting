module.exports = {
  // 默认的Truffle配置
  contracts_build_directory: "./src/build/contracts",

  networks: {
    development: {
      host: "127.0.0.1", // 本地网络
      port: 7545, // Ganache默认端口
      network_id: "*", // 匹配任何网络ID
    },
  },

  compilers: {
    solc: {
      version: "0.8.0", // 要使用的Solidity编译器版本
    },
  },
};
