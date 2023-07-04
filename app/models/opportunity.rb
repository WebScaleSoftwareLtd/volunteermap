class Opportunity < ApplicationRecord
    include AlgoliaSearch

    @@categories = [
        'Animal Shelter', 'Homeless Services', 'Food Bank', 'Soup Kitchen',
        'Humanitarian Aid', 'Environmental Action', 'Demonstrations', 'Other',
    ].freeze

    def self.categories
        @@categories
    end

    has_many :bookmarks, dependent: :destroy

    belongs_to :user
    belongs_to :domain_association, optional: true

    before_validation :set_uuid!
    validates :mentally_taxing, inclusion: { in: [true, false] }
    validates :physically_taxing, inclusion: { in: [true, false] }
    validates :time_flexible, inclusion: { in: [true, false] }
    validates :category, presence: true, inclusion: { in: @@categories }
    validates :title, presence: true, length: { maximum: 100, minimum: 5 }
    validates :description, presence: true, length: { maximum: 10000, minimum: 5 }
    validates :latitude, presence: true
    validates :longitude, presence: true
    validate :domain_association_is_valid!

    algoliasearch do
        attribute :created_at, :updated_at, :title, :description, :mentally_taxing,
            :physically_taxing, :time_flexible, :category, :uuid

        attribute :created_at_i do
            created_at.to_i
        end
        attribute :updated_at_i do
            updated_at.to_i
        end

        attribute :_geoloc do
            {
                lat: latitude.to_f,
                lng: longitude.to_f,
            }
        end

        attribute :domain_name do
            domain_association ? domain_association.domain : nil
        end
    end

    private

    def set_uuid!
        self.uuid = SecureRandom.uuid if uuid.nil?
    end

    def domain_association_is_valid!
        return if domain_association.nil?
        unless domain_association.validation_active
            errors.add :domain_association, "is not valid"
        end
    end
end
