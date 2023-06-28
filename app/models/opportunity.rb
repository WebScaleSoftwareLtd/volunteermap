class Opportunity < ApplicationRecord
    include AlgoliaSearch

    CATEGORIES = [
        'Animal Shelter', 'Homeless Services', 'Food Bank', 'Soup Kitchen',
        'Humanitarian Aid', 'Environmental Action', 'Demonstrations', 'Other',
    ]

    belongs_to :user
    belongs_to :domain_association, optional: true

    validates :mentally_taxing, inclusion: { in: [true, false] }
    validates :physically_taxing, inclusion: { in: [true, false] }
    validates :time_flexible, inclusion: { in: [true, false] }
    validates :category, presence: true, inclusion: { in: CATEGORIES }
    validate :domain_association_is_valid!

    algoliasearch do
        attribute :created_at, :updated_at, :title, :description, :mentally_taxing,
            :physically_taxing, :time_flexible, :category

        attribute :created_at_i do
            created_at.to_i
        end
        attribute :updated_at_i do
            updated_at.to_i
        end

        attribute :_geoloc do
            {
                lat: latitude,
                lng: longitude,
            }
        end

        attribute :domain_name do
            return nil if domain_association.nil?
            domain_association.domain
        end
    end

    private

    def domain_association_is_valid!
        return if domain_association.nil?
        unless domain_association.validation_active
            errors.add :domain_association, "is not valid"
        end
    end
end
