class Add2FaTokenToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :'2fa_token', :string, null: true
  end
end
