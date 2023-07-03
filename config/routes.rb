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
  get 'users/:username', to: 'user#profile'

  # Defines opportunity routes.
  get 'opportunities/new', to: 'opportunity#new_opportunity'
  post 'opportunities/new', to: 'opportunity#submit_opportunity'
  get 'opportunities/:id/edit', to: 'opportunity#edit_opportunity'
  post 'opportunities/:id/edit', to: 'opportunity#edit_opportunity_submit'
  get 'opportunities/:id', to: 'opportunity#opportunity'
end
