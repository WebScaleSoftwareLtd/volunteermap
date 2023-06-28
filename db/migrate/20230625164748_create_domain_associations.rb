class CreateDomainAssociations < ActiveRecord::Migration[7.0]
  def change
    create_table :domain_associations do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.boolean :validation_active, null: false, default: true
      t.string :domain, null: false, index: true
      t.integer :validation_check_count, null: false, default: 0

      t.timestamps
    end
  end
end
