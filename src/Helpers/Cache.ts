import config from '@/configs/index'
import logger from '@/Helpers/logger'
import type * as r from 'redis'

const redis: typeof r =
  config.redisUrl === 'redis-mock' ? require('redis-mock') : require('redis')

class Cache {
  // eslint-disable-next-line no-use-before-define
  private static _instance: Cache
  private _client?: r.RedisClientType

  private _initialConnection: boolean

  private constructor () {
    this._initialConnection = true
  }

  public static getInstance (): Cache {
    if (!Cache._instance) {
      Cache._instance = new Cache()
    }
    return Cache._instance
  }

  public async open (): Promise<void> {
    this._client = redis.createClient({
      url: config.redisUrl
    })
    const client = this._client

    client.on('connect', () => {
      logger.info('Redis: Connected')
    })
    client.on('ready', () => {
      if (this._initialConnection) {
        this._initialConnection = false
      }
      logger.info('Redis: Ready')
    })
    client.on('reconnecting', () => {
      logger.info('Redis: Reconnecting...')
    })
    client.on('end', () => {
      logger.info('Redis: end')
    })
    client.on('disconnected', () => {
      logger.error('Redis: disconnected')
    })
    client.on('error', function (err) {
      logger.error(`Redis: error: ${err}`)
    })
  }

  public close (): void {
    this._client!.quit()
  }

  public async setProp (
    key: string,
    value: string,
    expireAfter: number
  ): Promise<void> {
    await this._client!.set(key, value)
  }

  public async getProp (key: string): Promise<string | undefined | null> {
    const result = await this._client!.get(key)
    return result
  }
}

export default Cache.getInstance()
