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
        return redirect_to '/auth/login' unless user.present?
        render 'posting_editor'
    end

    def submit_posting
        # Handle if this should redirect to the login page.
        return redirect_to '/auth/login', status: :see_other unless user.present?

        # If a domain is present, transform it into a domain association.
        if params[:domain].present?
            params[:domain_association] = user.domain_associations.find_by(domain: params[:domain], validation_active: true)
            params.delete(:domain)
        else
            # Just to be safe...
            params.delete(:domain_association)
        end

        # Get the parameter filter.
        param_filter = params.permit(
            :domain_association, :mentally_taxing, :physically_taxing, :time_flexible,
            :category, :title, :description, :email, :phone, :website, :latitude, :longitude,
        )

        # Set the booleans to false if they are not present.
        param_filter[:mentally_taxing] = false unless param_filter[:mentally_taxing].present?
        param_filter[:physically_taxing] = false unless param_filter[:physically_taxing].present?
        param_filter[:time_flexible] = false unless param_filter[:time_flexible].present?

        # Attempt to create the opportunity.
        @result = user.opportunities.create(param_filter)
        if @result.valid?
            redirect_to "/opportunities/#{@result.uuid}"
        else
            params[:domain] = params[:domain_association].domain if params[:domain_association].present?
            render 'posting_editor', status: :bad_request
        end
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
