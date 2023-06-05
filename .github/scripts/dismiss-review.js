const { context, github } = require('@actions/github');

async function dismissReview() {
  const { owner, repo, number } = context.issue;
  // The GitHub bot is assumed to be the owner of the repository, adjust this if it's not the case
  const reviewOwner = owner;
  
  const { data: reviews } = await github.pulls.listReviews({
    owner,
    repo,
    pull_number: number
  });

  const botReview = reviews.find(review => review.user.login === reviewOwner);

  if(botReview) {
    await github.pulls.dismissReview({
      owner,
      repo,
      pull_number: number,
      review_id: botReview.id,
      message: 'Automatic dismissal of previous bot review.'
    });
  }
}

dismissReview();
