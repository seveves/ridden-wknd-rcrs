import { Component, h } from '@stencil/core';


@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot {

  render() {
    return (
      <div>
        <header>
          <div class="container">
            <h1>
              <stencil-route-link anchorClass="brand" url="/" exact={true}>Ridden</stencil-route-link>
            </h1>
            <h2>Weekend Racers</h2>
          </div>
        </header>

        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url='/' component='app-home' exact={true} />
              <stencil-route url='/race/:id' component='app-race' />
              <stencil-route url='/results/:id' component='app-results' />
            </stencil-route-switch>
          </stencil-router>
        </main>

        <footer>
          <div class="container">
            <p>Made with 💜 by <a href="https://github.com/seveves/ridden-wknd-rcrs">seveves</a></p>
          </div>
        </footer>
      </div>
    );
  }
}
