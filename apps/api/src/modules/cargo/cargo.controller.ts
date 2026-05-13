import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ListCargoQueryDto } from './dto/list-cargo-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('cargo')
@Controller({ path: 'cargo-posts', version: '1' })
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Açık yük ilanlarını listele (filtreli)' })
  list(@Query() query: ListCargoQueryDto) {
    return this.cargoService.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'İlan detayı' })
  findOne(@Param('id') id: string) {
    return this.cargoService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.CARGO_OWNER, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Yeni yük ilanı oluştur' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCargoDto) {
    return this.cargoService.create(user.sub, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.CARGO_OWNER, UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'İlanı güncelle' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCargoDto,
  ) {
    return this.cargoService.update(user.sub, id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.CARGO_OWNER, UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'İlanı iptal et' })
  cancel(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.cargoService.cancel(user.sub, id);
  }

  @ApiBearerAuth('access-token')
  @Get('me/mine')
  @ApiOperation({ summary: 'Kendi ilanlarım' })
  mine(@CurrentUser() user: CurrentUserPayload) {
    return this.cargoService.findByOwner(user.sub);
  }
}
