import { Model } from 'pinia-orm'

type Option = Record<string, number|string>|string[]|string;

export default class Template extends Model {
  static entity = 'templates'

  static fields() {
    return {
      id: this.uid(),
      options: this.attr({}),
      game: this.string(''),
    }
  }
  declare id: string;
  declare game: string;
  declare options: {[key: string]: Option}

  static piniaOptions = {
    persist: true
  }
}
