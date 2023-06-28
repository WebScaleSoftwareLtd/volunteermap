class DomainValidationJob < ApplicationJob
  queue_as :domain_validation

  def perform(association_id)
    # Gracefully get the association if it exists.
    association = DomainAssociation.find association_id
    return if association.nil?

    # Return if the validation is dead.
    return if association.validation_active

    # Re-schedule this job in an hour if the validation check returns true.
    if association.validation_check!
      DomainValidationJob.set(wait: 1.hour).perform_later association_id
    end
  end
end
