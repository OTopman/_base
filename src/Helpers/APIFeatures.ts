export class APIFeatures {
  private data: any[] | undefined
  private readonly queryString: any

  constructor (data: any[], queryString: any) {
    this.data = data
    this.queryString = queryString
  }

  public getData (): any[] { return this.data! };

  public filter () {
    const queryObj = { ...this.queryString }
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`).toString()

    this.data = this.data!.find(JSON.parse(queryStr))

    return this
  }

  public sort () {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.data = this.data!.sort(sortBy)
    }
    return this
  }

  public paginate () {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit

    const dt = [...this.data!]
    let counter = 0
    while (counter < limit) {
      this.data![counter] = dt[skip + counter]
      counter++
    }

    return this
  }
}
