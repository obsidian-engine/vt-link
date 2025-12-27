-- +goose Up
-- +goose StatementBegin

CREATE TABLE rich_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  template VARCHAR(10) NOT NULL CHECK (template IN ('2x3', '1x3', '2x2')),
  image_url TEXT NOT NULL,
  areas JSONB NOT NULL DEFAULT '[]',
  line_rich_menu_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rich_menus_user_id ON rich_menus(user_id);
CREATE INDEX idx_rich_menus_active ON rich_menus(user_id, is_active);
CREATE UNIQUE INDEX idx_rich_menus_line_id ON rich_menus(line_rich_menu_id) WHERE line_rich_menu_id IS NOT NULL;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS rich_menus;

-- +goose StatementEnd
