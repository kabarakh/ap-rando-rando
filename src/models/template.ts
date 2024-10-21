import { Model } from 'pinia-orm'

export default class Template extends Model {
  static entity = 'templates'

  static fields() {
    return {
      id: this.uid(),
      content: this.attr({})
    }
  }
  declare id: string;
  declare content: {[key: string]: any}

  static piniaOptions = {
    persist: true
  }
}
