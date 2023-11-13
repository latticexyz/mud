import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra({
  async redirects() {
    return [
      {
        source: "/what-is-mud",
        destination: "/introduction",
        permanent: true,
      },
      {
        source: "/quick-start",
        destination: "/quickstart",
        permanent: true,
      },   
      {
        source: "/store",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/installation",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/reading-and-writing",
        destination: "/store/table-libraries#reading-data",
        permanent: true        
      },
      {
        source: "/store/config",
        destination: "/store/table-libraries#config",
        permanent: true        
      },
      {
        source: "/store/advanced-features",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/indexing",
        destination: "/store/introduction",
        permanent: true        
      },           
      {
        source: "/store/spec",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/gas-efficiency",
        destination: "/store/introduction",
        permanent: true        
      },  
      {
        source: "/store/using-without-world",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/store/internals",
        destination: "/store/introduction",
        permanent: true        
      },
      {
        source: "/world",
        destination: "/world/introduction",
        permanent: true        
      },
      {
        source: "/world/world-101",
        destination: "/world/introduction",
        permanent: true        
      },
      {
        source: "/world/config",
        destination: "/cli/config",
        permanent: true        
      },
      {
        source: "/world/deployer",
        destination: "/cli/deploy",
        permanent: true        
      },           
      {
        source: "/world/subsystems",
        destination: "/world/introduction",
        permanent: true        
      },
      {
        source: "/world/community-computers",
        destination: "/world/introduction",
        permanent: true        
      },
      {
        source: "/world/querying",
        destination: "/state-query/introduction",
        permanent: true        
      },
      {
        source: "/world/internals",
        destination: "/world/introduction",
        permanent: true        
      },           
      {
        source: "/client-side",
        destination: "/state-query/typescript/recs",
        permanent: true        
      },
      {
        source: "/indexer",
        destination: "/services/indexer",
        permanent: true        
      },            
      {
        source: "/cli",
        destination: "/cli/tablegen",
        permanent: true        
      },
      {
        source: "/ecs",
        destination: "/guides/emojimon/1-preface-the-ecs-model.mdx",
        permanent: true        
      },           
      {
        source: "/plugins",
        destination: "/world/introduction",
        permanent: true        
      },
      {
        source: "/tutorials",
        destination: "/guides/hello-world",
        permanent: true        
      },
      {
        source: "/tutorials/emojimon",
        destination: "/guides/emojimon",
        permanent: true        
      },      
      {
        source: "/tutorials/emojimon/preface-the-ecs-model",
        destination: "/guides/emojimon/1-preface-the-ecs-model.mdx",
        permanent: true        
      },
    ];
  },
});
