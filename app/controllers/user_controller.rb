class UserController < ApplicationController
    def current_user
        redirect_to '/auth/login' unless user.present?
        redirect_to "/users/#{user.username}"
    end

    def update_user
        # TODO
    end

    def bookmarks
        # TODO
    end

    def domains
        # TODO
    end

    def posting_new
        # TODO
    end

    def submit_posting
        # TODO
    end

    def profile
        if user && user.username == params[:username]
            @profile_user = user
        else
            @profile_user = User.find_by!('UPPER(username) = UPPER(?)', params[:username])
        end
        @opportunities = @profile_user.opportunities.page(params[:page])
    end
end
