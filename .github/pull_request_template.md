# Problem/Need:

<!-- issue # or problem description or why something should be fixed/added -->

# Suggested changes:

<!-- to make it easier to review, here's a general summary of what I did to fix it or improve it: -->

# Checklist:

- [ ] ran cypress tests locally with `npx cypress open`
- [ ] ran lighthouse site quality test locally with `yarn test-quality`
- [ ] updated package.json version it'd bump up to if approved
- [ ] updated package-lock.json version it'd bump up to if approved
- [ ] after this PR is approved/merged, don't forget to:
  - [ ] have the semver version updated as needed
  - [ ] have the live/prod site updated

(Note: If you don't have write permissions to the surge.sh sites, disable the husky pre-commit hook in package.json, but don't check in that line change in package.json)
