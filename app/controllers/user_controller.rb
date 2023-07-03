class UserController < ApplicationController
    before_action :redirect_to_user, except: [:profile]

    def current_user
        redirect_to "/users/#{user.username}"
    end

    def update_user
        # TODO
    end

    def bookmarks
        # TODO
    end

    def domains
        @domains = user.domain_associations
    end

    def add_domain
        @result = user.domain_associations.create(domain: params[:domain])
        render 'domains'
    end

    def profile
        if user && user.username.downcase == params[:username].downcase
            @profile_user = user
        else
            @profile_user = User.find_by!('UPPER(username) = UPPER(?)', params[:username])
        end
        @opportunities = @profile_user.opportunities.page(params[:page])
    end

    private

    def redirect_to_user
        redirect_to '/auth/login' unless user.present?
    end
end
