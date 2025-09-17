import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // Retry failed requests up to 2 times for GET requests
      retry({
        count: 2,
        delay: 1000,
        resetOnSuccess: true
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error del cliente: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              errorMessage = 'No se puede conectar con el servidor. Verifique su conexión a internet.';
              break;
            case 400:
              errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
              break;
            case 401:
              errorMessage = 'No autorizado. Verifique sus credenciales.';
              break;
            case 403:
              errorMessage = 'Acceso prohibido.';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor.';
              break;
            case 503:
              errorMessage = 'Servicio no disponible. Intente más tarde.';
              break;
            default:
              errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
