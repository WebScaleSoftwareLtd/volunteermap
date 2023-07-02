class AddUuidToOpportunities < ActiveRecord::Migration[7.0]
  def change
    add_column :opportunities, :uuid, :string, null: false, index: { unique: true }
  end
end
