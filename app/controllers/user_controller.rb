class UserController < ApplicationController
    before_action :redirect_to_auth, except: [:profile]
    before_action :turbo_frames_only, only: [:password_frame, :authentifcator_frame]

    def current_user
        redirect_to "/users/#{user.username}"
    end

    def user_settings; end

    def update_user
        @errors = []

        res = user_model_updates
        @errors = res if res.present?

        res = email_update
        @errors.concat(res) if res.present?

        render 'user_settings', status: @errors.present? ? :bad_request : :ok
    end

    def bookmarks
        @bookmarks = user.bookmarks.page(params[:page])
    end

    def domains
        @domains = user.domain_associations
    end

    def add_domain
        @domain = user.domain_associations.create(domain: params[:domain])
        @domain = nil if @domain.valid?
        @domains = DomainAssociation.where(user: user)
        render 'domains'
    end

    def delete_domain
        user.domain_associations.destroy_by(domain: params[:domain])
        domains
        render 'domains'
    end

    def revalidate_domain
        domain = user.domain_associations.find_by(domain: params[:domain])
        domain.validation_check! if domain.present?
        @domains = DomainAssociation.where(user: user)
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

    def password_frame; end

    def authentifcator_frame; end

    private

    def user_model_updates
        permit = params.permit(:username)

        res = user.update(permit)
        return nil if res

        user.errors.full_messages
    end

    def email_update
        return if params[:email] == user.email

        if user.email_update_request.present?
            # We already have a request for this, don't send another email.
            return if params[:email] == user.email_update_request.email

            # Delete the old request, we're making a new one.
            user.email_update_request.destroy
        end

        # Create a new request.
        res = EmailUpdateRequest.create(user: user, email: params[:email])
        return if res.valid?
            
        # Return any errors.
        user.email_update_request = nil
        res.errors.full_messages
    end

    def redirect_to_auth
        redirect_to '/auth/login' unless user.present?
    end

    def turbo_frames_only
        raise ActionController::RoutingError.new('Not Found') unless turbo_frame_request?
    end
end
