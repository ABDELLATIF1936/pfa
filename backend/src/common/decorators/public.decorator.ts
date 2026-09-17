import { SetMetadata } from '@nestjs/common';

// Permet d'exempter une route de l'authentification globale.
export const Public = () => SetMetadata('isPublic', true);