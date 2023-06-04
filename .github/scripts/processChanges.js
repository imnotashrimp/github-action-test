const fs = require('fs');
const { Octokit } = require("@octokit/rest");
const githubToken = process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: githubToken });

(async function(){
  const ig = JSON.parse(fs.readFileSync('./auto-approve.json', 'utf8'));
  const autoApproveList = ignore().add(ig);
  const filesChanged = fs.readFileSync('./files-changed.txt', 'utf8').split("\n");
  let isApproved = true;
  for(let file of filesChanged){
    if(!autoApproveList.ignores(file)){
      isApproved = false;
      break;
    }
  }

  const { owner, repo, number } = JSON.parse(fs.readFileSync('./pr-info.json', 'utf8'));

  if(isApproved){
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: number,
      event: "APPROVE"
    });
  } else {
    const { data: reviews } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: number
    });
    for(const review of reviews){
      if(review.user.login === "github-actions[bot]" && review.state === "APPROVED"){
        await octokit.pulls.dismissReview({
          owner,
          repo,
          pull_number: number,
          review_id: review.id,
          message: "New changes dismissed previous approval"
        });
      }
    }
  }
})();
