# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_07_18_103845) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.integer "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "bookmarks", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "opportunity_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["opportunity_id"], name: "index_bookmarks_on_opportunity_id"
    t.index ["user_id", "opportunity_id"], name: "index_bookmarks_on_user_id_and_opportunity_id", unique: true
    t.index ["user_id"], name: "index_bookmarks_on_user_id"
  end

  create_table "domain_associations", force: :cascade do |t|
    t.integer "user_id", null: false
    t.boolean "validation_active", default: true, null: false
    t.string "domain", null: false
    t.integer "validation_check_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["domain"], name: "index_domain_associations_on_domain"
    t.index ["user_id"], name: "index_domain_associations_on_user_id"
  end

  create_table "email_update_requests", force: :cascade do |t|
    t.string "email", null: false
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_email_update_requests_on_email", unique: true
    t.index ["token"], name: "index_email_update_requests_on_token", unique: true
    t.index ["user_id"], name: "index_email_update_requests_on_user_id", unique: true
  end

  create_table "half_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_half_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_half_tokens_on_user_id"
  end

  create_table "opportunities", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "domain_association_id"
    t.boolean "mentally_taxing", null: false
    t.boolean "physically_taxing", null: false
    t.boolean "time_flexible", null: false
    t.string "category", null: false
    t.string "title", null: false
    t.string "description", null: false
    t.string "email"
    t.string "phone"
    t.string "website"
    t.decimal "latitude", precision: 10, scale: 6, null: false
    t.decimal "longitude", precision: 10, scale: 6, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "uuid", null: false
    t.index ["domain_association_id"], name: "index_opportunities_on_domain_association_id"
    t.index ["user_id"], name: "index_opportunities_on_user_id"
    t.index ["uuid"], name: "index_opportunities_on_uuid", unique: true
  end

  create_table "password_update_requests", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_password_update_requests_on_token", unique: true
    t.index ["user_id"], name: "index_password_update_requests_on_user_id"
  end

  create_table "pending_signups", force: :cascade do |t|
    t.string "email", null: false
    t.string "email_token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "redirect_to"
    t.index ["email"], name: "index_pending_signups_on_email"
    t.index ["email_token"], name: "index_pending_signups_on_email_token", unique: true
  end

  create_table "user_backup_codes", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "backup_code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["backup_code"], name: "index_user_backup_codes_on_backup_code"
    t.index ["user_id"], name: "index_user_backup_codes_on_user_id"
  end

  create_table "user_tokens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_user_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_user_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "email", null: false
    t.string "user_validation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "password_digest", null: false
    t.string "2fa_token"
    t.index "UPPER(username)", name: "index_users_on_UPPER_username", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["user_validation_id"], name: "index_users_on_user_validation_id", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bookmarks", "opportunities"
  add_foreign_key "bookmarks", "users"
  add_foreign_key "domain_associations", "users"
  add_foreign_key "email_update_requests", "users"
  add_foreign_key "half_tokens", "users"
  add_foreign_key "opportunities", "users"
  add_foreign_key "password_update_requests", "users"
  add_foreign_key "user_backup_codes", "users"
  add_foreign_key "user_tokens", "users"
end
