const fs = require('fs');
const getStdin = require('get-stdin');

(async () => {
  const bookmarklet = await getStdin();

  const template = `
<div align="center">
  <h1>Team-Life Balancer</h1>
  <p>
    <b>hakuna bookmarklet to check the team-life balance</b>
  </p>
  <p>
    <b><a href="${bookmarklet}">Team-Life Balancer</a></b>
  </p>
</div>`;

  fs.writeFile('readme.md', template, error => {
    if (error) {
      console.log(error);
    }
  });
})();
