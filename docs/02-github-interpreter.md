# Our prototype: GitHub Interpreter
For our GitHub Interpreter, we took the model and applied repo and user data sourced by the GitHub API. This is how each criteria will use data and determine health scores.

`$U = user where contributions in $C commits for $W weeks is > $P% of total contributions`

**Direction**
* Criterion 1: Has a CONTRIBUTING.md file
* Criterion 2: $X% of pull requests are reviewed or commented by $U contributors
* Criterion 3: $X% of last $Y commits are from $U contributors
* Criterion 4: $X of issues that have been assigned in the last $W weeks 

**Maintenance**
* Criterion 1: Has had a commit in $W weeks
* Criterion 2: Open to close issue ratio is less than $X%
* Criterion 3: $X% of issues are labeled in $W weeks
* Criterion 4: $X% Issues have responses from someone in $U contributor (last Y weeks)
* Criterion 5: Does the readme contain an ARCHITECTURE.md

**Community**
* Criterion 1: Has more than $X stars + watches in $W weeks
* Criterion 2: Has $X forks in $W weeks
* Criterion 3: Has external PRs in $W weeks
* Criterion 3: $X% of commits for past $W weeks are NOT in $U contributors
* Criterion 4: $X% of issues are created OR commented by user NOT in $U contributors
* Criterion 4: Repo used by is greater than $X

If you see a way for a criteria to be better defined, or if you want to recommend GitHub data to help us better define the health of a product, please let us know in the Issues.