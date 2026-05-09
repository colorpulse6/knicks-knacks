alter table food_logs
  add column if not exists image_path text;

update food_logs
set image_path = image_url
where image_path is null
  and image_url is not null
  and image_url !~* '^https?://';

update storage.buckets
set public = false
where id = 'food-images';

drop policy if exists "Food images are publicly accessible"
  on storage.objects;
