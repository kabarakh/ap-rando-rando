import Dexie, { type EntityTable } from 'dexie';
import type { GameConfig, Template } from '@/models/template';

const db = new Dexie('randos') as Dexie & {
  templates: EntityTable<Template, 'id'>,
  gameConfig: EntityTable<GameConfig, 'id'>
};

db.version(1).stores({
  templates: 'id++, game',
  gameConfig: 'id++, game, weight, state'
})

db.open();

const database = {
  async addTemplate(template: Template) {
    return db.templates.add(template);
  },
  async getAllTemplates() {
    return db.templates.toArray();
  },
  async addGameConfig(gameConfig: GameConfig) {
    return db.gameConfig.add(gameConfig);
  },
  async getGameConfig(game: string) {
    return db.gameConfig.where('game', game).toArray();
  },
  async getAllGameConfigs() {
    return db.gameConfig.toArray();
  },
}

export default database;
