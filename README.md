![logo](/docs/assets/product-pulse.svg)

**Product Pulse is a data model that helps you build a snapshot of a product's or project's health based on user data and activity. Couple this model with your own interpreter to track the health of your product, whether it's a code repo or project management software.**

## Highlights

- **Get a high-level look at product or project health** based on user and repo activity, visualizing scores for Direction, Maintenance, and Community health.
- **Criteria can be adopted for low/no code products** making this inclusive of all types of technical projects.
- **Integrate the Product Pulse data model with other non-repo services** like other project management solutions (Asana, Monday, etc.).

## Usage and configuration

![Image of tool](/docs/assets/example.png)

Users can input their public GitHub repo into Product Pulse and get their scores. Product managers can visualize multiple product cards to keep tabs on the health of products and their dependencies.

## Motivation

Product Pulse is a data model that helps you map user and project data (like repo and project management activity) to a simple health check based on three scores: Direction, Maintenance, and Community. The vision for the Product Pulse data model is that it can interfaced with any custom interpretation. Our first exploration is tracking the health of GitHub repos. Other usage includes mapping the model to popular project management tools like Asana or Monday and interpreting its user signals accordingly.

![data flow](/docs/assets/flow.svg)

Our amazing team created Product Pulse as part of Hack Week May 2022 to help fellow product builders have a quick way to gauge the health of other products and projects they might want to use. Product builders can use Product Pulse to gauge the health of their products, but also see the health of others.

This can ease the way in which we identify which products are doing well, and which products might need some help. The sooner we can identify products that need help, the sooner we can reduce friction and burnout from the challenges involved in maintaining products.

**The initial GitHub interpretation of this product uses repo activity to determine product and repo health.**

We gauge product health by:

* **Direction** - Are there owners and leaders of this product directing the work toward successful outcomes?
* **Maintenance** - Are commits, issues, and PRs being created, reviewed, and closed to help maintain product health?
* **Community** - Are there external contributors and metrics indicating that the product is growing and supporting its community?

This is all up for improvement as more people use this hack week project.

### The model
Here's a high-level look at our data model for Product Pulse. We made these criteria as generic as possible so that a user could see how to connect each criteria to relevant data that will come from their product repo or project tracking tool.

**Direction**
* Criterion 1 (low): Communicates how to contribute
* Criterion 2 (high): Same person approves of changes
* Criterion 3 (med): Same person makes changes
* Criterion 4 (low): People get assigned to issues

**Maintenance**
* Criterion 1 (high): Has had recent changes
* Criterion 2 (high): Open to close issue ratio is less than $X%
* Criterion 3 (low): Data is organized
* Criterion 4 (medium): Communication with issues
* Criterion 5 (medium): Explains architecture

**Community**
* Criterion 1 (low): Has more than $X positive sentiment (likes/watches/stars)
* Criterion 2 (low): Has 3rd party development
* Criterion 3 (high): Has 3rd party contributions
* Criterion 4 (high): Has users

### GitHub Interpreter
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

Get more detail about the modeling, criteria, and our GitHub interpreter in our [documentation](/docs).

## Future state / roadmap

We want offer a backend service that provides endpoints for:
* JSON output of data so you can interpret and visualize the data as you see useful
* Badge output so you can add it to your readme or website to see product health
* An embeddable "card" to use on a custom website or dashboard

Please see our [documentation](/docs) for more details on our roadmap.

## Documentation

Please see our documentation for more on:

* [the Product Pulse data model and examples of interpreters](/docs/data-model)
* [scoring and criteria definitions](/docs/github-interpreter)
* [roadmap](/docs/roadmap)

## Contributing

The best way to contribute to Product Pulse is to test it out by inputting your product repos into it and letting us know what you think.

## License

Product Pulse is free software, and may be redistributed under the terms specified in the [license](https://github.com/balena-io-playground/blob/master/LICENSE).