import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';


@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends  BaseExceptionFilter {

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message =  'Internal Server Error'

    switch(exception.code){
      case 'P2002':
        status = HttpStatus.CONFLICT;
        let target = exception.meta?.target;

        if (!target && (exception.meta as any)?.driverAdapterError) {
          target = (exception.meta as any).driverAdapterError.cause?.constraint?.fields;
        }

        const fieldName = Array.isArray(target) 
            ? target.join(', ') 
            : (target || 'a field');
        
        message = `Dublicate entry: The field '${fieldName}' already exists.`
        break;
      
      case 'P2025':
        status = HttpStatus.NOT_FOUND
        message = 'The record you are looking for does not exist.'
        break;

      default:
        break;
    }

    response.status(status).json({
      statusCode: status,
      timestap: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
