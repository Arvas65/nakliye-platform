import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mevcut kullanıcı + profil' })
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Profil bilgilerini güncelle' })
  updateProfile(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Diğer kullanıcı profili (public alanlar)' })
  findPublic(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
