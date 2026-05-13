import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('offers')
@ApiBearerAuth('access-token')
@Controller({ path: 'offers', version: '1' })
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Roles(UserRole.TRANSPORTER)
  @Post()
  @ApiOperation({ summary: 'İlana teklif ver' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Verdiğim/aldığım teklifler' })
  mine(@CurrentUser() user: CurrentUserPayload) {
    return this.offersService.findByUser(user.sub, user.role as UserRole);
  }

  @Roles(UserRole.CARGO_OWNER)
  @Post(':id/accept')
  @ApiOperation({ summary: 'Teklifi kabul et (yük sahibi)' })
  accept(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.offersService.accept(user.sub, id);
  }

  @Roles(UserRole.CARGO_OWNER)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Teklifi reddet' })
  reject(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.offersService.reject(user.sub, id);
  }

  @Roles(UserRole.TRANSPORTER)
  @Delete(':id')
  @ApiOperation({ summary: 'Teklifi geri çek' })
  withdraw(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.offersService.withdraw(user.sub, id);
  }
}
