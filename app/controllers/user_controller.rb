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
        redirect_to '/auth/login' unless user.present?
    end

    def submit_posting
        # TODO
    end

    def profile
        if user && user.username.downcase == params[:username].downcase
            @profile_user = user
        else
            @profile_user = User.find_by!('UPPER(username) = UPPER(?)', params[:username])
        end
        @opportunities = @profile_user.opportunities.page(params[:page])
    end
end
