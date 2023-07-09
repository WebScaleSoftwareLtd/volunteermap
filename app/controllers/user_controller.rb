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

    def password_frame_submit
        @errors = []

        # Check the current password.
        if !user.authenticate(params[:current_password])
            @errors << 'Current password is incorrect.'
            return render 'password_frame', status: :bad_request
        end

        # Check the new password matches the confirmation.
        if params[:new_password] != params[:new_password_confirmation]
            @errors << 'New password does not match confirmation.'
            return render 'password_frame', status: :bad_request
        end

        # Try to update the password.
        res = user.update(password: params[:new_password])
        @errors = user.errors.full_messages unless res
        render 'password_frame'
    end

    def authenticator_frame
        render user[:'2fa_token'] ?
            'existing_authenticator_init_frame' :
            'new_authenticator_init_frame'
    end

    def delete_authenticator
        return unless check_password
        user.update('2fa_token' => nil)
        render 'new_authenticator_init_frame'
    end

    def backup_codes_view
        return unless check_password
        @codes = user.user_backup_codes.pluck(:backup_code)
        render 'backup_codes'
    end

    def regenerate_codes
        return unless check_password
        @codes = user.generate_backup_codes
        render 'backup_codes'
    end

    def setup_authenticator
        # Do our own check password logic since the DRY method targets updates.
        password = params[:authenticator_password]
        unless user.authenticate(password)
            @error = 'The password you entered is incorrect.'
            return render 'new_authenticator_init_frame', status: :bad_request
        end

        # Get the secret and 2FA code from the body.
        secret = params[:authenticator_secret]
        code = params[:authenticator_code]
        code_valid = false
        begin
            code_valid = ROTP::TOTP.new(secret).verify(code, drift_behind: 15)
        rescue
            # Do nothing, code_valid is already false.
        end

        # If the code is invalid, return an error.
        unless code_valid
            @error = 'The 2FA code you entered is incorrect.'
            return render 'new_authenticator_init_frame', status: :bad_request
        end

        # If we get here, the code is valid, so we can set the 2FA token.
        user.update!('2fa_token' => secret)

        # Get the recovery codes and render the backup codes view.
        @codes = user.generate_backup_codes
        render 'backup_codes'
    end

    def authenticator_update_post
        return delete_authenticator if params[:remove_2fa]
        return backup_codes_view if params[:recovery_codes]
        return regenerate_codes if params[:regenerate_codes]
        render 'existing_authenticator_init_frame'
    end

    def authenticator_add_post
        return setup_authenticator if params[:setup_2fa]
        render 'new_authenticator_init_frame'
    end

    def authenticator_router
        user[:'2fa_token'] ?
            authenticator_update_post :
            authenticator_add_post
    end

    private

    def check_password
        password = params[:authenticator_password]
        res = user.authenticate(password)
        unless res
            @invalid_password = true
            render 'existing_authenticator_init_frame', status: :bad_request
        end
        res
    end

    def user_model_updates
        permit = params.permit(:username)

        res = user.update(permit)
        return nil if res

        user.errors.full_messages
    end

    def email_update
        params[:email] = params[:email].downcase if params[:email].class == String

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
