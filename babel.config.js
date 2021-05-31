const presets = [
  [
    '@babel/env',
    {
      targets         : {
        ie     : '10',
        edge   : '17',
        firefox: '60',
        chrome : '67',
        safari : '11.1',
      },
      target: ['web', 'es5'],
      corejs          : 3,
      useBuiltIns     : 'usage',
      modules         : true,
      shippedProposals: true
    },
  ],
];

module.exports = {presets};