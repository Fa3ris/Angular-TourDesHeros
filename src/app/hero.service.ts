import { Injectable } from '@angular/core';
import { Hero } from './hero';
// import { HEROES } from './test-heroes';
import { Observable, of } from 'rxjs'; // Reactive JS library
import { MessageService } from './message.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes'; // URL to web api

  httpOptions = {
    headers: new HttpHeaders({
      'Contente-Type': 'application.json'
    })
  };

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) { }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
  /** GET heroes from the server */
  getHeroes(): Observable<Hero[]> { // returns Observable because HttpClient returns Observable

    // this.messageService.add('HeroService : héros récupérés');
    // this.log('héros récupérés');
    // return of(HEROES);

    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('héros récupérés')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }
  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {

    const url = `${this.heroesUrl}/${id}`;

    // this.messageService.add(`HeroService : héros n° ${id} récupéré`);
    /* this.log(`héros n° ${id} récupéré`);
    return of(HEROES.find(heroIndex => {
      return heroIndex.id === id;
    })); */

    return this.http.get<Hero>(url).
      pipe(
        tap(_ => this.log(`héros n° ${id} récupéré`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );

  }

  searchHeroes(term: string): Observable<Hero[]> {

    if (!term.trim()) {

      // if not search term, return empty hero array
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
      .pipe(
        tap(_ => this.log(`héros trouvés correspondant à "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(_ => this.log(`mise à jour du héros n° {hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }
  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {

    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap((newHero: Hero) => this.log(`héros ajouté avec le n° ${newHero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }


  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {

    const id = typeof hero === 'number' ? hero : hero.id;

    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`héro n° ${id} supprimé`)),
        catchError(this.handleError<Hero>('deleteHero'))
      );
  }

  /*   Handle Http operation that failed.
     Let the app continue.
     @param operation - name of the operation that failed
     @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
