const { Client } = require("@opensearch-project/opensearch");

const pushToOpenSearch = async (id, title, description, author, videoUrl) => {
  try {
    console.log("pushing to open search...", videoUrl);
    var client = new Client({ node: process.env.HOST_AIVEN });
    var index_name = "search-video";
    var document = {
      title: title,
      description: description,
      author: author,
      videoUrl: videoUrl,
    };
    console.log(document);
    var response = await client.index({
      id: id,
      index: index_name,
      body: document,
      refresh: true,
    });
    console.log("added document to open search...");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = pushToOpenSearch;
