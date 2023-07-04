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

    private

    def redirect_to_user
        redirect_to '/auth/login' unless user.present?
    end
end
