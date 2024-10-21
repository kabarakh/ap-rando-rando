import { Model } from 'pinia-orm'
import { Cast, Uid, Attr } from 'pinia-orm/decorators'
import { ArrayCast } from 'pinia-orm/casts'

export default class Template extends Model {
  static entity = 'templates'

  @Uid() declare id: string;
  @Attr('{}') @Cast(() => ArrayCast) declare content: Record<string, any>

  static piniaOptions = {
    persist: true
  }
}
