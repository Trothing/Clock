INSERT INTO messages (
    chat_id,
    sender_id,
    type,
    content,
    created_at
)
SELECT 
    25 AS chat_id,
    (ARRAY[2, 3])[floor(random() * 2 + 1)] AS sender_id,
    'text'::message_type AS type,
    'Тестове повідомлення №' || i AS content,
    NOW() - (random() * INTERVAL '30 minutes') AS created_at
FROM generate_series(1, 1000) AS i;