Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root 'home#home'

  # Defines authentication routes.
  get 'auth/login', to: 'authentication#login_form'
  post 'auth/login', to: 'authentication#login_post'
  delete 'auth/logout', to: 'authentication#logout'
  get 'auth/register', to: 'authentication#register_enter_email_form'
  post 'auth/register', to: 'authentication#register_enter_email_post'
  get 'auth/register/:email_token', to: 'authentication#register_remainder_form'
  post 'auth/register/:email_token', to: 'authentication#register_remainder_post'

  # Defines user routes.
  get 'user', to: 'user#current_user'
  post 'user', to: 'user#update_user'
  get 'user/bookmarks', to: 'user#bookmarks'
  get 'user/domains', to: 'user#domains'
  get 'user/posting/new', to: 'user#posting_new'
  post 'user/posting/new', to: 'user#submit_posting'
  get 'users/:username', to: 'user#profile'
end
