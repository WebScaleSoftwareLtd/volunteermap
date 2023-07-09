<p align="center">
  <img src="./public/logo-black.png" alt="VolunteerMap Logo" />
</p>

A website for mapping volunteering opportunities. Powered by Hotwired, Rails, and Algolia.

## Setting up for Development

To setup your development environment for the version of Rails and Ruby we use, you will want to install rbenv on your system. Once this is done, go ahead and run `rbenv install` to install the version of Ruby we are using (typically near the latest). You can then do `bundler` to install all dependencies including Rails.

On the first install, you will need to make an account with [Algolia](https://www.algolia.com/) for searching and [Google Maps Platform](https://developers.google.com/maps/) for mapping. From here, open a terminal and run `EDITOR=nano bin/rails credentials:edit --environment=development`. You will want to add the following with your keys substituted in:
```yaml
algolia:
    application_id: <your application id>
    api_key: <your api key>
    read_only_api_key: <your "frontend" api key>

gmaps:
    api_key: <your api key>
```

From here, run `bin/rails db:schema:load` to setup your database. Now you can run `bin/dev` and go to port 3000!
