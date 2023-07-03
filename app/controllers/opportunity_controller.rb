class OpportunityController < ApplicationController
    before_action :find_record, except: [:new_opportunity, :submit_opportunity]

    def new_opportunity
        return redirect_to '/auth/login' unless user.present?
        render 'posting_editor'
    end

    def submit_opportunity
        param_filter = prep_opportunity_submit
        return if param_filter.nil?

        @result = user.opportunities.create(param_filter)
        if @result.valid?
            redirect_to "/opportunities/#{@result.uuid}"
        else
            params[:domain] = params[:domain_association].domain if params[:domain_association].present?
            render 'posting_editor', status: :bad_request
        end
    end

    def edit_opportunity
        @edit = true
        return redirect_to '/auth/login' unless user.present?
        raise ActiveRecord::RecordNotFound unless @record.user == user
        map_record_into_params
        render 'posting_editor'
    end

    def edit_opportunity_submit
        @edit = true
        param_filter = prep_opportunity_submit
        return if param_filter.nil?

        raise ActiveRecord::RecordNotFound unless @record.user == user

        success = @record.update(param_filter)
        if success
            redirect_to "/opportunities/#{@record.uuid}"
        else
            params[:domain] = params[:domain_association].domain if params[:domain_association].present?
            @result = @record
            render 'posting_editor', status: :bad_request
        end
    end

    def opportunity; end

    private

    def prep_opportunity_submit
        # Handle if this should redirect to the login page.
        unless user.present?
            redirect_to '/auth/login', status: :see_other
            return nil
        end

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

        # Return the parameter filter.
        param_filter
    end

    def map_record_into_params
        params[:domain] = @record.domain_association.domain if @record.domain_association.present?
        [
            :mentally_taxing, :physically_taxing, :time_flexible,
            :category, :title, :description, :phone, :website, :latitude, :longitude,
        ].each do |key|
            params[key] = @record[key]
        end
    end

    def find_record
        @record = Opportunity.find_by!(uuid: params[:id])
    end
end
