import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    async globalSearch(
        @Query('q') q: string,
        @Query('sportId') sportId?: string,
    ) {
        return this.searchService.globalSearch(q, sportId);
    }
}
