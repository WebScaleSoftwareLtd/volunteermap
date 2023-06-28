class CreateOpportunities < ActiveRecord::Migration[7.0]
  def change
    create_table :opportunities do |t|
      t.belongs_to :user, null: false, foreign_key: true, index: true
      t.belongs_to :domain_association, null: true, foreign_key: false, index: true

      t.boolean :mentally_taxing, null: false
      t.boolean :physically_taxing, null: false
      t.boolean :time_flexible, null: false
      t.string :category, null: false

      t.string :title, null: false
      t.string :description, null: false
      t.string :email, null: true
      t.string :phone, null: true
      t.string :website, null: true

      t.decimal :latitude, null: false, precision: 10, scale: 6
      t.decimal :longitude, null: false, precision: 10, scale: 6

      t.timestamps
    end
  end
end
