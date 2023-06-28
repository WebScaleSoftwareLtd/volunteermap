class AddRedirectToToPendingSignups < ActiveRecord::Migration[7.0]
  def change
    add_column :pending_signups, :redirect_to, :string
  end
end
