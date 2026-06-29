
CREATE POLICY "Public read of report attachments"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'report-attachments');

CREATE POLICY "Anyone can upload report attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'report-attachments');
